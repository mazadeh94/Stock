package ir.stock.controller.cusotmer;

import java.io.*;
import java.sql.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

import com.google.gson.Gson;

import ir.stock.data.*;
import ir.stock.domain.*;

@WebServlet("/customer/get")
public class GetCustomer extends HttpServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		Gson gson = new Gson();
		Customer customer = null;
		
		response.setContentType("text/html");
		response.addHeader("Access-Control-Allow-Origin", "*");
		
		PrintWriter out = response.getWriter();

		String username = request.getParameter("username");
		StockRepository repo = StockRepository.getRepository();
		
		if (username == null || username.equals(""))
		{
			try
			{
				List<Customer> customerList = repo.getCustomerList();
				out.print(gson.toJson(customerList));
			}
			catch (SQLException ex)
			{
				System.err.println("Unable to connect to server : " + customer.getUsername());
				System.err.println(ex);
			}
		}
		else
		{
			try
			{
				customer = repo.getCustomer(username);
				out.print(gson.toJson(customer));
			}
			catch (SQLException ex)
			{
				System.err.println("Unable to connect to server : " + customer.getUsername());
				System.err.println(ex);
			}
			
		}
	}
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		doPost(request, response);
	}
}
